// src/components/common/Input.jsx
const Input = ({ value, onChange, placeholder, className, ...props }) => {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`p-2 border rounded ${className}`}
      {...props}
    />
  );
};

export default Input;
