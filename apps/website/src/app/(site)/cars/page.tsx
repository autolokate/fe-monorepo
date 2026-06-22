import { BrandsDirectoryPage } from "@/components/catalogue/BrandsDirectoryPage";
import { carsMetadata } from "./config/metadata";

export const metadata = carsMetadata;

export default function CarsPage() {
  return (
    <main className="relative">
      <BrandsDirectoryPage vehicleType="cars" />
    </main>
  );
}
