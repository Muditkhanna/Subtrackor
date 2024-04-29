export default function SparkleIcon(){
    return (
        <section className="flex justify-around mt-8 sm:mt-12 items-center">
        <div className=" hidden sm:block bg-gray-800/50 w-[240px] h-[480px] rounded-xl"></div>
        <div className="hidden sm:block">
        <SparkleIcon/>
        </div>
        <div className="bg-gray-800/50 w-[240px] h-[480px] rounded-xl"></div>
    </section>
    )
}