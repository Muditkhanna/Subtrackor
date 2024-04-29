import TranscriptionItem from "./TranscriptionItem"

export default function TranscriptionEditor(
    {awstranscriptionItems,setAWStranscriptionItems})
    {
    function updateTranscriptionItem(index,prop,e){
    const newAWSitems=[...awstranscriptionItems];
    const newItem = {...newAWSitems[index]};
    newItem[prop]=e.target.value;
    newAWSitems[index]=newItem;
    setAWStranscriptionItems(newAWSitems);
}
    return(
    <>
    <div className='grid grid-cols-3 sticky top-0 bg-violet-800/80 p-2 rounded-md'>
        <div className='w-24'>From</div>
        <div className='w-24'>End</div>
        <div className='w-24'>Content</div>
    </div>
    {awstranscriptionItems.length>0 && (
        <div className="h-48 sm:h-auto overflow-scroll sm:overflow-auto">
            {awstranscriptionItems.map((item,key)=>(
                <div key={key}>
                <TranscriptionItem 
                    item={item} 
                    handleStartTimeChange={(e)=>updateTranscriptionItem(key,'start_time',e)} 
                    handleEndTimeChange={(e)=>updateTranscriptionItem(key,'end_time',e)} 
                    handleContentChange={(e)=>updateTranscriptionItem(key,'content',e)}/>
                </div>
                ))}
        </div>
    )}
    </>
    )
}