export default function Home() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <h1 className="text-4xl font-bold text-center">
        Welcome to our Next.js App! ⚡️
      </h1>
      <p className="text-xl text-center text-muted-foreground max-w-2xl">
        Get started by editing this page and building something amazing. This
        template includes Supabase integration, authentication, and styling with
        Tailwind CSS.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
    </div>
  );
}
