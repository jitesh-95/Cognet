import Image from "next/image";
import styles from "../styles/page.module.css";
import Mindmap from "../components/Mindmap";

export default function Home() {
  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <Mindmap />
    </main>
  );
}
