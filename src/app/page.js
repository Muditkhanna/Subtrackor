import DemoSection from "@/components/DemoSection";
import Headers from "@/components/Headers";
import UploadForm from "@/components/UploadForm";
export default function Home(){
  const h1 = 'Drop the video, we\'ll add the cool captions. Simple as that!'
  return(
    <> 
      <Headers h1Text = {h1}
    h2Text = "Just upload your video & we'll work our magic to captionize it."/>
      <div className="text-center">
        <UploadForm/>
      </div>
      <DemoSection/>
    </>
  )
}