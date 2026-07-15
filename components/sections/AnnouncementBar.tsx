export default function AnnouncementBar() {
  return (
    <div className="bg-warm-brown py-2.5 px-4 text-center font-inter text-[13px]">
      <span className="text-ivory/70 mr-2">🎯 Early Access:</span>
      <span className="text-ivory font-medium">We are accepting our first 10 clients — lock in launch pricing before it changes.</span>
      <a href="#contact" className="ml-3 text-[#FAC775] font-semibold underline underline-offset-2 hover:text-ivory transition-colors">Claim your spot →</a>
    </div>
  );
}
