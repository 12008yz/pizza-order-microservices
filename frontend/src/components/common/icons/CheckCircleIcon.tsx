import AnimatedCheck from '../AnimatedCheck';

export default function CheckCircleIcon() {
  return (
    <span className="relative inline-block" style={{ width: 16, height: 16 }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
        <circle cx="8" cy="8" r="7.5" fill="#FFFFFF" stroke="#101010" strokeWidth="1" />
      </svg>
      <span className="absolute" style={{ left: 4, top: 4 }}>
        <AnimatedCheck size={8} color="#101010" strokeWidth={1.5} />
      </span>
    </span>
  );
}
