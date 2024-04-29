import React, { useEffect, useState, useRef } from "react";
import SparkleIcon from "./SparkleIcon";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { TranscriptionItemsToSRT } from "@/libs/awsTranscriptionHelpers";

export default function ResultVideo({ filename, transcriptionItems }) {
    const videoUrl = `https://mudit-epic-captions.s3.ap-south-1.amazonaws.com/${filename}`;
    const [loaded, setLoaded] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
    const [outlineColor, setOutlineColor] = useState('#000000');
    const [progress, setProgress] = useState(1);
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef(null);

    useEffect(() => {
        loadFFmpeg();
    }, []);

    const loadFFmpeg = async () => {
        try {
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
            const ffmpeg = ffmpegRef.current;
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        } catch (error) {
            console.error("Failed to load FFmpeg:", error);
        }
    };

    const transcode = async () => {
        try {
            const ffmpeg = ffmpegRef.current;
            const srt = TranscriptionItemsToSRT(transcriptionItems);
            await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
            await ffmpeg.writeFile('subs.srt', srt);
            await ffmpeg.exec([
                '-i', filename,
                '-preset', 'ultrafast',
                '-vf', `subtitles=subs.srt:fontsdir=/tmp:force_style='Fontname=Roboto,FontSize=30,MarginV=100,PrimaryColour=${primaryColor},OutlineColour=${outlineColor}'`,
                'output.mp4'
            ]);
            const data = await ffmpeg.readFile('output.mp4');
            const videoBlobURL = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
            videoRef.current.src = videoBlobURL;
            setProgress(1);
        } catch (error) {}
    };
    
    
    
    

    const handlePrimaryColorChange = (e) => {
        setPrimaryColor(e.target.value);
    };

    const handleOutlineColorChange = (e) => {
        setOutlineColor(e.target.value);
    };

    return (
        <>
            <div className='mb-4'>
                <button onClick={transcode} className="bg-green-600 py-2 px-6 rounded-full inline-flex gap-2 border-purple-700/50 cursor-pointer">
                    <SparkleIcon/>
                    <span>Apply Captions</span>
                </button>
            </div>
            <div>
                Primary Color:
                <input type="color"
                    className="border-0 p-0 m-0 rounded-md"
                    value={primaryColor}
                    onChange={handlePrimaryColorChange}
                />
                <br />
                Outline Color:
                <input type="color"
                    className="border-0 p-0 rounded-md"
                    value={outlineColor}
                    onChange={handleOutlineColorChange}
                />
            </div>
            <div className="rounded-xl overflow-hidden relative">
                {progress < 1 && (
                    <div className="absolute inset-0 bg-black/80 flex items-center">
                        <div className="w-full text-center">
                            <div className="bg-[#03fc45]/30 mx-8 rounded-lg overflow-hidden relative h-8">
                                <div className="bg-[#03fc45] h-full" style={{ width: progress * 100 + '%' }}>
                                    <h3 className="text-white text-xl absolute inset-0 py-1">
                                        {parseInt(progress * 100)}%
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
