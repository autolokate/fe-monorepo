import { BrandsDirectoryPage } from "@/components/catalogue/BrandsDirectoryPage";
import { bikesMetadata } from "./config/metadata";

export const metadata = bikesMetadata;

export default function BikesPage() {
  return (
    <main className="relative">
      <BrandsDirectoryPage vehicleType="bikes" />
    </main>
  );
}
