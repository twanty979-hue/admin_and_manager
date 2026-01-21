export interface ProductImage {
  url?: string;
  path: string;
  role: string;
  sort: number;
}

export interface ProductSpecs {
  size: string;
  material: string;
  spec_type: string;
  main_image: {
    path: string;
    role: string;
  };
  images: ProductImage[];
  thickness_cm: number;
  width_cm: number;
  length_cm: number;
  [key: string]: any; // เผื่อฟิลด์อื่นๆ ใน JSONB
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  image_url: string | null;
  specs: ProductSpecs;
  status: string;
}