import Spinner from "./Spinner";

export default function LoadingButton({ loading, children, ...rest }) {
  return (
    <button disabled={loading || rest.disabled} {...rest}>
      {loading ? <><Spinner /> <span style={{ marginLeft: 8 }}>Please wait…</span></> : children}
    </button>
  );
}
