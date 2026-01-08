import { ProfileSidebar } from "@/components/profile";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 min-h-screen flex py-16 px-4">
      <div className="container relative mx-auto px-4 lg:px-32">
        <ProfileSidebar />
        <main className="ml-[calc(16rem+4rem)] max-w-4xl text-gray-700 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
