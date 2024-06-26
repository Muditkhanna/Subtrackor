import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import uniqid from 'uniqid';
export async function POST(req){
    const formData = await req.formData();
    const file = formData.get('file');
    
    const {name,type} = file;
    const data = await file.arrayBuffer();

    const s3client = new S3Client({
        region:'ap-south-1',
        credentials:{
            accessKeyId:process.env.MUDIT_1999_AWS_ACCESS_KEY,
            secretAccessKey:process.env.MUDIT_1999_AWS_SECRET_ACCESS_KEY,
        }
    });
    const ext = name.split('.').slice(-1)[0];
    const id = uniqid();
    const newName = id+'.'+ext;

    const uploadCommand = new PutObjectCommand({
        Bucket:process.env.MUDIT_1999_BUCKET_NAME,
        Body:data,
        ACL:'public-read',
        ContentType:type,
        Key:newName,
    })

    s3client.send(uploadCommand);
    return Response.json({name,ext,newName,id});
}