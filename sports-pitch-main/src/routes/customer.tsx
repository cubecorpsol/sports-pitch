import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/customer")({
  head: () => ({ meta: [{ title: "Customer Portal — TurfPro" }, { name: "description", content: "Access the TurfPro customer portal for bookings, nearby venues and co-player events." }] }),
  component: CustomerPortal,
});

function CustomerPortal() {
  const [announcements, setAnnouncements] = useState<any[]>([
    {
      _id: 'test-1',
      title: 'Test Announcement',
      description: 'This is a test announcement to verify the UI works',
      publishDate: new Date().toISOString(),
      status: 'Active'
    }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      console.log('Fetching announcements from /api/announcements');
      const response = await fetch('/api/announcements');
      const data = await response.json();
      console.log('Announcements data:', data);
      if (data.success && data.announcements) {
        // Filter active announcements
        const activeAnnouncements = data.announcements.filter((a: any) => a.status === 'Active');
        console.log('Active announcements:', activeAnnouncements);
        if (activeAnnouncements.length > 0) {
          setAnnouncements(activeAnnouncements);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Announcements Section - Top */}
        {announcements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-4">Announcements</h2>
            <div className="grid gap-4">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="rounded-2xl border border-border p-6 bg-card shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{announcement.description}</p>
                      {announcement.publishDate && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Published: {new Date(announcement.publishDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Customer Portal</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Access TurfPro customer features without admin controls. Browse turfs, and join nearby events.
            </p>
          </div>
          <div className="rounded-3xl border border-border p-6 glass-card">
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Welcome</div>
            <p className="mt-4 text-sm text-foreground">Use the portal below to reach the customer-facing booking experience.</p>
            <div className="mt-6 grid gap-3">
              <Link to="/turfs" className="block rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground text-center">Browse turfs</Link>
              <Link to="/turfs" className="block rounded-2xl border border-border px-4 py-3 text-sm text-foreground text-center">Find co-players</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
