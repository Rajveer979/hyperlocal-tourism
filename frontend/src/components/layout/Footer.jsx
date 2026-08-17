import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-stone-500">
        <p>
          <span className="font-semibold text-stone-700">Hyperlocal Tourism</span> · Smart India Hackathon · working
          name, final name TBD
        </p>
        <nav className="flex gap-4">
          <Link to="/explore" className="hover:text-brand-dark">Explore</Link>
          <Link to="/host" className="hover:text-brand-dark">Host</Link>
          <Link to="/daypass" className="hover:text-brand-dark">Day Pass</Link>
          <Link to="/admin" className="hover:text-brand-dark">Admin</Link>
        </nav>
      </div>
    </footer>
  )
}
