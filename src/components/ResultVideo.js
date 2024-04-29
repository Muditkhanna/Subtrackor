import { useEffect, useState, useRef } from "react";
import sparkleIcon from "./SparkleIcon";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { TranscriptionItemsToSRT } from "@/libs/awsTranscriptionHelpers";
import roboto from './../fonts/Roboto-Regular.ttf';
import robotoBold from './../fonts/Roboto-Bold.ttf';

export default function ResultVideo({ filename, transcriptionItems }) {
    const videoUrl = "https://mudit-epic-captions.s3.ap-south-1.amazonaws.com/" + filename;
    const [loaded, setLoaded] = useState(false);
    const [PrimaryColour,setPrimaryColour] = useState('#FFFFFF');
    const [OutlineColour,setOutlineColour] = useState('#000000');
    const [progress,setProgress] = useState(1);
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef(null);
    useEffect(() => {
        videoRef.current.src = videoUrl;
        load();
    });

    const load = async () => {
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = ffmpegRef.current;
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            await ffmpeg.writeFile('/tmp/roboto.ttf',await fetchFile(roboto));
            await ffmpeg.writeFile('/tmp/roboto-bold.ttf',await fetchFile(robotoBold));
            setLoaded(true);
        } catch (error) {
            console.error("Failed to load FFmpeg:", error);
        }
    };
    function rgb2ffmpegColor(rgb){
        const bgr = rgb.slice(5,7)+rgb.slice(3,5)+rgb.slice(1,3);
        return '&H'+ bgr + '&';
    }
    const transcode = async () => {
        try {
            const ffmpeg = ffmpegRef.current;
            const srt = TranscriptionItemsToSRT(transcriptionItems);
            await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
            await ffmpeg.writeFile('subs.srt',srt);
            videoRef.current.src=videoUrl;
            await new Promise((resolve,reject)=>{
                videoRef.current.onloadedmetadata = resolve;
            });
            const duration = videoRef.current.duration;

            ffmpeg.on('log', ({ message }) => {
                const regexresult=/time=([0-9:.]+)/.exec(message);
                if(regexresult && regexresult?.[1]){
                    const howMuchisDone = regexresult?.[1];
                    const [hours,mins,secs]= howMuchisDone.split(':');
                    const doneTotalsecs = hours*3600 + mins*60 + secs; 
                    const transcodingprogress = doneTotalsecs/duration;
                    setProgress(transcodingprogress);
                }
            });
            await ffmpeg.exec([
                '-i', filename,
                '-preset','ultrafast',
                '-vf',`subtitles=subs.srt:fontsdir=/tmp:force_style='Fontname=Roboto,FontSize=30,MarginV=100,
                PrimaryColour=${rgb2ffmpegColor(PrimaryColour)},OutlineColour=${rgb2ffmpegColor(OutlineColour)}'`,
                'output.mp4'  
            ]);
            const data = await ffmpeg.readFile('output.mp4');
            const videoBlobURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
            videoRef.current.src = videoBlobURL;
            setProgress(1);
        } catch (error) {
            console.error("Transcoding failed:", error);
        }
    };

    return (
        <>
            <div className='mb-4'>
                <button onClick={transcode} className="bg-green-600 py-2 px-6 rounded-full inline-flex gap-2 border-purple-700/50 cursor-pointer">
                    {sparkleIcon()}
                    <span>Apply Captions</span>
                </button>
            </div>
            <div>
                Primary Color:
                <input type="color" 
                    className="border-0 p-0 m-0"
                    value={PrimaryColour} 
                    onChange={e=>setPrimaryColour(e.target.value)}
                    />
                <br/>
                Outline Color:
                <input type="color"
                    className="border-0 p-0"
                    value={OutlineColour}
                    onChange={e=>setOutlineColour(e.target.value)}
                    />
            </div>
            <div className="rounded-xl overflow-hidden relative">
                {progress && progress<1 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center">
                        <div className="w-full text-center">
                            <div className="bg-bg-gradient-from/50 mx-8 rounded-lg overflow-hidden relative">
                                <div className="bg-bg-gradient-from h-8" style={{width:progress*100+'%'}}>
                                    <h3 className="text-white text-xl absolute inset-0 py-1">
                                {parseInt(progress*100)}%
                                    </h3>
                                </div>
                            </div>
                    </div>
                    </div>
                )}
                <video className='w-auto' controls ref={videoRef} data-video={0} src={videoUrl}></video>
            </div>
        </>
    );
}



