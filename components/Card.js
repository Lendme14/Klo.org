export default function Card({ children, className }) {
  return (
    <div className={`p-4 shadow-lg rounded-lg ${className || ""}`}>
      {children}
    </div>
  );
}
