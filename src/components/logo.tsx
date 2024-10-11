import Image from "next/image";
import logo from "../../public/logo.svg";
import Link from "next/link";

export default function Logo() {
  const size = 33;
  return (
    <Link href="/">
      <Image src={logo} alt="Petsoft logo" width={size} height={size} />
    </Link>
  );
}
