import { prisma } from "@/lib/prisma";

export type HostingStatus = "PENDING" | "RUNNING" | "STOPPED" | "ERROR";

export async function provisionHosting(
  serverId: string,
): Promise<{ endpointUrl: string }> {
  const endpointUrl = `https://hosted.mcpmarket.com/${serverId}`;

  await prisma.mcpServer.update({
    where: { id: serverId },
    data: {
      hostingStatus: "PENDING",
      endpointUrl,
    },
  });

  return { endpointUrl };
}

export async function getHostingStatus(
  serverId: string,
): Promise<{ status: string; endpointUrl: string | null }> {
  const server = await prisma.mcpServer.findUnique({
    where: { id: serverId },
    select: { hostingStatus: true, endpointUrl: true },
  });

  if (!server) throw new Error("Server not found");

  return {
    status: server.hostingStatus ?? "NOT_PROVISIONED",
    endpointUrl: server.endpointUrl,
  };
}
