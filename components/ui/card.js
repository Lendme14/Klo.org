// components/ui/card.js
export default function Card({ children }) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
        {children}
      </div>
    );
  }
  