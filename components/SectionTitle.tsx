interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2 className={`font-poppins text-[1.2rem] font-semibold ${className ?? ""}`.trim()}>
      {children}
    </h2>
  );
}