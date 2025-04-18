// components/ui/button.js
export default function Button({ children, ...props }) {
    return (
      <button {...props} style={{ padding: '10px', background: '#333', color: '#fff', borderRadius: '6px' }}>
        {children}
      </button>
    );
  }
  