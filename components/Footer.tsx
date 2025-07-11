export default function Footer() {
  return (
    <footer className="w-full flex justify-center text-center text-xs text-gray-400 py-4 px-2">
      <span className="flex justify-center items-center gap-1 font-inter text-[0.9rem] font-normal text-gray-400 mt-8 mb-0">
        Desenvolvido por:{" "}
        <a
          href="https://www.linkedin.com/in/gustavo-henrique-6b8352304/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Gustavo Henrique
        </a>
      </span>
    </footer>
  );
}