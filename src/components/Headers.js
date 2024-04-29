export default function Headers({
    h1Text = '',
    h2Text = '',
}){
    return (
        <section className="text-center mt-12 sm:mt-24 mb-2 sm:mb-8">
        <h1 className=" text-xl sm-text-3xl text-[#42f5ec]" style={{textShadow:'1px 1px 0, rgba(0,0,0,.2)'}}>{h1Text}</h1>
        <h2 className="text-[#42f5ec]/75 text-sm sm:text-base">
          {h2Text}
        </h2>
      </section>
    )
}