const styles = {
  Placed: "bg-sand text-ink",
  Packed: "bg-amber-100 text-amber-800",
  "Out for delivery": "bg-sky-100 text-sky-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-700",
};

export const STATUSES = Object.keys(styles);

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${styles[status] || styles.Placed}`}>
      {status}
    </span>
  );
}
