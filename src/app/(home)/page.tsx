import Index from "@/components/Home/Index";
import IMS from "@/components/IMS/Home/Index";
const IS_STANDALONE = process.env.NEXT_PUBLIC_IS_STANDALONE === "true";
function HomePage() {
  return <>{IS_STANDALONE ? <IMS /> : <Index />}</>;
}

export default HomePage;
