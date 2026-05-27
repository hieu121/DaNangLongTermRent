import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing.id}`} className="card block transition hover:shadow-md">
      <div className="h-36 rounded-lg bg-slate-200" />
      <h3 className="mt-3 line-clamp-1 text-base font-semibold">{listing.title}</h3>
      <p className="mt-1 text-sm text-slate-600">
        {listing.area} - {listing.min_stay} tháng
      </p>
      <p className="mt-2 text-lg font-bold text-choTot-blue">{Number(listing.price).toLocaleString()} đ</p>
      <p className="mt-1 text-xs text-slate-500">Đăng bởi {listing.owner_name}</p>
    </Link>
  );
}
