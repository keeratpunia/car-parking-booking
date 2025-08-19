export default function Spinner({ size = 16 }) {
  const s = { width: size, height: size, border: "2px solid #fff", borderRightColor: "transparent",
              borderRadius: "50%", display: "inline-block", animation: "spin .8s linear infinite", verticalAlign:"middle" };
              
  return (
    <span style={s}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
