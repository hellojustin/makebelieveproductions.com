export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center px-10 py-6">
      <span className="text-white font-light tracking-widest text-sm">
        MAKE BELIEVE
      </span>
      <a
        href="mailto:justin@makebelieveproductions.com"
        className="text-violet-300/70 text-sm tracking-wide hover:text-violet-300 transition-colors"
      >
        Get in touch →
      </a>
    </nav>
  );
}
