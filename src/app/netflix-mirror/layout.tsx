// This layout removes the global Navbar and Footer for the Netflix mirror page
// so the player can go truly full-screen without UI chrome in the way.
export default function NetflixMirrorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
