import Image from "next/image";

export default function HeaderBar() {
  return (
    <header className="mb-8">
      <div className="w-full  flex-col sm:flex-row items-center gap-2 sm:gap-4 relative">
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/favicon.ico"
            alt="Favicon"
            width={112}
            height={112}
            className="w-28 h-28 ml-0 mr-0 justify-end items-center"
          />
          <h1 className="font-poppins text-[2rem] font-bold mb-1 text-center">
            Flavinho Festas
          </h1>

          <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
            Gerenciamento de estoque
          </p>
        </div>
      </div>
    </header>
  );
}