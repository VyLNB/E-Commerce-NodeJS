import { Address, CartItem } from "@/lib/types";
import reviewImage1 from "@/public/images/Review=Image1.png";
import reviewImage2 from "@/public/images/Review=Image2.png";

export const products = [
  {
    id: 0,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 13124,
    oldPrice: 124,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 1,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 122151,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 2,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 124121,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 3,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 125126,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 4,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 151216,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 5,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 16121,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 6,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 1212412,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 8,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 1251671,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 9,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 1126124,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 10,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 12112516,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 11,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 121414124,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 12,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 12412415,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
  {
    id: 13,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 12515124,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },

  {
    id: 14,
    name: "Apple iPhone 14 Pro Max",
    image:
      "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    price: 124124213,
    oldPrice: 1499,
    rating: 4.8,
    reviews: 216,
  },
];

export const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Apple iPhone 14 Pro Max",
    description: "128GB Deep Purple",
    code: "#25139526913984",
    price: 21121251,
    quantity: 1,
    imageAlt: "Apple iPhone 14 Pro Max image",
    imageUrl:
      "https://images.unsplash.com/photo-1695822877321-15ef5412b82e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    name: "AirPods Max Silver",
    description: "Silver",
    code: "#53459358345",
    price: 12314124,
    quantity: 1,
    imageAlt: "AirPods Max Silver image",

    imageUrl:
      "https://images.unsplash.com/photo-1695822877321-15ef5412b82e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Apple Watch Series 9 GPS",
    description: "41mm Starlight Aluminium",
    code: "#63632324",
    price: 124125215,
    quantity: 1,
    imageAlt: "Apple Watch Series 9 GPS image",
    imageUrl:
      "https://images.unsplash.com/photo-1695822877321-15ef5412b82e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const product = {
  id: 0,
  name: "Apple iPhone 14 Pro Max",
  price: 1399,
  originalPrice: 1499,
  rating: 4.8,
  reviewCount: 216,
  images: [
    {
      id: 1,
      url: "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    },
    {
      id: 2,
      url: "https://lh3.googleusercontent.com/CXxJZQcIKIvhEN5JfGFJE6pAKfRVClpqQThf7X5ZeXbZcoJbwk5QmFbORNmu0FplFv4BGuofUj_yJ2AfhD-_LGmczWnhFJA8eg=w500-rw",
    },
    {
      id: 3,
      url: "https://lh3.googleusercontent.com/1NWRj-onn5RyqaXVaqS-c1j9UPpbcg3DKzzOdVsTug0RnV7sWn4Xg2ERKy3uHAbthNSWJJBX1SxRp-XoMOFkitvJ7S95a5PlHQ=w500-rw",
    },
    {
      id: 4,
      url: "https://lh3.googleusercontent.com/GziGS9cGzf29SopippS0o5v_vmAkWVzSQl2KbpRr62Uz-gGwiKLV-ioTMBtGmrw7AlrwsZe9bexVYXzRK6PN_O8RVBt79iz2=w500-rw",
    },
  ],
  colors: [
    { name: "Deep Purple", class: "bg-indigo-900" },
    { name: "Space Black", class: "bg-gray-800" },
    { name: "Gold", class: "bg-yellow-400" },
    { name: "Red", class: "bg-red-600" },
  ],
  storage: ["128 GB", "256 GB", "512 GB", "1 TB"],
  shortDescription: "",
  description:
    "Just as a book is judged by its cover, the first thing you notice when you pick up a modern smartphone is the display. Nothing surprising, because advanced technologies allow you to practically level the display frames and cutouts for the front camera and speaker, leaving no room for bold design solutions. And how good that in such realities Apple everything is fine with displays. Both critics and mass consumers always praise the quality of the picture provided by the products of the Californian brand. And last year's 6.7-inch Retina panels, which had ProMotion, caused real admiration for many.",
  specs: {
    Scope: "1-year warranty",
    Model: "A2894",
    System: "iOS 16",
    CPU: "A16 Bionic",
    "Display diagonal": '6.7"',
    "Main camera": "48MP",
  },
};

export const reviews = {
  averageRating: 4.8,
  totalReviews: 125,
  ratingDistribution: [
    { stars: 5, count: 102 },
    { stars: 4, count: 18 },
    { stars: 3, count: 2 },
    { stars: 2, count: 1 },
    { stars: 1, count: 2 },
  ],
  comments: [
    {
      id: 1,
      author: "Sara Klang",
      avatar: "https://cdn-icons-png.freepik.com/512/219/219988.png",
      rating: 5,
      date: "2025-10-06",
      comment:
        "This phone is a game-changer! The camera quality is outstanding and the Dynamic Island is more useful than I thought. Battery life is also a huge plus.",
    },
    {
      id: 2,
      author: "Karl Pihl",
      avatar: "https://cdn-icons-png.freepik.com/512/219/219988.png",
      rating: 5,
      date: "2025-10-05",
      comment:
        "An excellent upgrade from my previous model. It's incredibly fast and the screen is beautiful. Highly recommended!",
      images: [reviewImage1, reviewImage2],
    },
    {
      id: 3,
      author: "Amy Vu",
      avatar: "https://cdn-icons-png.freepik.com/512/219/219988.png",
      rating: 4,
      comment:
        "Great phone, but it's a bit heavy. Other than that, no complaints. The always-on display is a nice touch.",
      date: "2025-10-03",
    },
  ],
};

export const mockAddresses: Address[] = [
  {
    _id: 1,
    recipientName: "Lê Phú Hào",
    phone: "0935572755",
    city: "TP. Hồ Chí Minh",
    district: "Quận 7",
    ward: "Phường Tân Thuận Đông",
    street: "Chung cư An Hòa 1, Trần Trọng Cung, Đường số 3",
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const relatedProducts = [];
