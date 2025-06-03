interface SectionTitleProps {
  children: React.ReactNode;
}

export default function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="font-poppins text-[1.2rem] font-semibold">{children}</h2>
  );
}