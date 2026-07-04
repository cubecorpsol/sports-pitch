import { apiRequest } from "@/lib/apiClient";
import type { Announcement, ApiAnnouncement } from "@/types";

function mapAnnouncement(a: ApiAnnouncement): Announcement {
  return {
    id: a._id,
    title: a.title,
    description: a.description,
    priority: a.priority,
    date: a.publishDate?.slice(0, 10) ?? "",
    published: a.status === "Active",
  };
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await apiRequest<{ announcements: ApiAnnouncement[] }>("/api/announcements");
  return res.announcements.map(mapAnnouncement);
}

export async function createAnnouncement(input: {
  title: string;
  description: string;
  priority: ApiAnnouncement["priority"];
  publishDate: string;
}): Promise<Announcement> {
  const res = await apiRequest<{ announcement: ApiAnnouncement }>("/api/announcements", {
    method: "POST",
    body: { ...input, status: "Active" },
  });
  return mapAnnouncement(res.announcement);
}

export async function updateAnnouncement(
  id: string,
  input: { title: string; description: string; priority: ApiAnnouncement["priority"]; publishDate: string; published: boolean }
): Promise<Announcement> {
  const res = await apiRequest<{ announcement: ApiAnnouncement }>(`/api/announcements/${id}`, {
    method: "PUT",
    body: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      publishDate: input.publishDate,
      status: input.published ? "Active" : "Inactive",
    },
  });
  return mapAnnouncement(res.announcement);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await apiRequest(`/api/announcements/${id}`, { method: "DELETE" });
}
