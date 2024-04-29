export function clearTranscriptionItems(items){
    items.forEach((item,key)=>{
        if(!item.start_time){
            const prev=items[key-1];
            prev.alternatives[0].content+=item.alternatives[0].content;
            delete items[key];
        }
    });
    return items.map(item=>{
        const{start_time,end_time}=item;
        const content = item.alternatives[0].content;
        return {start_time,end_time,content};
    });
}
function secondsTOHHMMSS(timestring){
    const date = new Date(parseFloat(timestring)*1000);
    return date.toISOString().slice(11,23).replace('.',',');
}
export function TranscriptionItemsToSRT(items){
    let srt='';
    let i =1;

    items.filter(item=>!!item).forEach(item=>{
        //seq
        srt += i+"\n";
        const {start_time,end_time}=item;
        srt += secondsTOHHMMSS(start_time)
        + ' --> '
        + secondsTOHHMMSS(end_time)
        + "\n";
        srt += item.content+"\n"
        srt += "\n";
        i++;
    })
    return srt;
}