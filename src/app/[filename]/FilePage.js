'use client'
import TranscriptionEditor from '@/components/TranscriptionEditor';
import { clearTranscriptionItems } from '@/libs/awsTranscriptionHelpers';
import axios from 'axios';
import ResultVideo from '@/components/ResultVideo';
import { useEffect, useState } from 'react';
export default function FilePage({params}){
    const filename = params.filename;
    const [isTranscribing,setIstranscribing]=useState(false);

    const [awstranscriptionItems,setAWStranscriptionItems]=useState([]);
    const [isFetchingInfo,setIsFetchingInfo]=useState(false);

        function getTranscription(){
        setIsFetchingInfo(true);
        axios.get('/api/transcribe?filename='+filename).then(response =>{
            setIsFetchingInfo(false);
            const status = response.data?.status;
            const transcription = response.data?.transcription;
            if(status==='IN_PROGRESS'){
                setIstranscribing(true);
                setTimeout(getTranscription,3000);
            }else
            {
                setIstranscribing(false);
                setAWStranscriptionItems(
                    clearTranscriptionItems(transcription.results.items)
                );
            }
        });
    }
    useEffect(()=>{ 
        if(filename){
            getTranscription();
        }
    },[filename]);

    

    if(isTranscribing){
        return(
            <div>Transcribing your video...</div>
        )
    }
    if(isFetchingInfo){
        return(
            <div>Fetching Information...</div>
        )
    }

    return(
    <div>
        <div className='grid sm:grid-cols-2 gap-16 sm:gap-16'>
        <div className=''>
            <h2 className='text-2xl mb-4 text-white/80'>Transcription</h2>
            <TranscriptionEditor
            awstranscriptionItems={awstranscriptionItems}
            setAWStranscriptionItems={setAWStranscriptionItems}
            />
        </div>
        <div>
        <h2 className='text-2xl mb-4 text-white/80'>Result</h2>
        <ResultVideo filename={filename} transcriptionItems={awstranscriptionItems}/>
        </div>
    </div>
</div>
    );
}

