
import { GetTranscriptionJobCommand, StartTranscriptionJobCommand, TranscribeClient } from "@aws-sdk/client-transcribe";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// Define a cache object to store transcription results
const transcriptionCache = {};

// Function to create and return an AWS Transcribe client
function getClient() {
    return new TranscribeClient({
        region: 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });
}

// Function to create a transcription job command
function createTranscriptionCommand(filename) {
    return new StartTranscriptionJobCommand({
        TranscriptionJobName: filename,
        OutputBucketName: process.env.BUCKET_NAME,
        OutputKey: filename + '.transcription',
        IdentifyLanguage: true,
        Media: {
            MediaFileUri: 's3://' + process.env.BUCKET_NAME + '/' + filename
        }
    });
}

// Function to retrieve the transcription job status
async function getJobStatus(filename) {
    const transcribeClient = getClient();
    try {
        const transcriptionJobStatusCommand = new GetTranscriptionJobCommand({
            TranscriptionJobName: filename,
        });
        return await transcribeClient.send(transcriptionJobStatusCommand);
    } catch (error) {
        return null; // Job not found or error occurred
    }
}

// Function to convert a stream to string
async function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        stream.on('error', reject);
    });
}

// Function to retrieve the transcription file from S3
async function getTranscriptionFile(filename) {
    const transcriptionFileName = filename + '.transcription';
    const s3Client = new S3Client({
        region: 'ap-south-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });
    const getObjectCommand = new GetObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: transcriptionFileName,
    });

    try {
        const transcriptionFileResponse = await s3Client.send(getObjectCommand);
        return JSON.parse(await streamToString(transcriptionFileResponse.Body));
    } catch (error) {
        return null; // Transcription file not found or error occurred
    }
}

// Main function to handle HTTP GET requests
export async function GET(req) {
    const url = new URL(req.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const filename = searchParams.get('filename');

    if (!filename) {
        return new Response("Error: Filename is empty", { status: 400 });
    }

    // Check if transcription is available in cache
    if (transcriptionCache[filename]) {
        return new Response(JSON.stringify({
            status: 'COMPLETED',
            transcription: transcriptionCache[filename],
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Check existing transcription job status
    const existingJobStatus = await getJobStatus(filename);
    if (existingJobStatus) {
        const jobStatus = existingJobStatus.TranscriptionJob.TranscriptionJobStatus;
        if (jobStatus === 'COMPLETED') {
            // Fetch transcription file from S3 and store it in cache
            const transcription = await getTranscriptionFile(filename);
            if (transcription) {
                transcriptionCache[filename] = transcription;
                return new Response(JSON.stringify({
                    status: 'COMPLETED',
                    transcription,
                }), { headers: { 'Content-Type': 'application/json' } });
            }
        }
        return new Response(JSON.stringify({
            status: jobStatus,
        }), { headers: { 'Content-Type': 'application/json' } });
    }

    // If transcription job doesn't exist, start a new one
    const transcribeClient = getClient();
    try {
        const transcriptionCommand = createTranscriptionCommand(filename);
        const newJob = await transcribeClient.send(transcriptionCommand);
        return new Response(JSON.stringify({
            status: newJob.TranscriptionJob.TranscriptionJobStatus,
        }), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response("Error: Failed to start transcription job", { status: 500 });
    }
}
