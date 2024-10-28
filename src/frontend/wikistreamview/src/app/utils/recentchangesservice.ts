import * as signalR from "@microsoft/signalr";

interface RecentChangeObject {
  title?: string; // Example of a required string prop
  total?: number;
  id?: number;
  type?: string;
  domain: string;
  namespace?: string;
  comment?: string;
  user?: string;
  timestamp?: number;
  isBot?: boolean;
  isMinor?: boolean;
  wiki: string;
  parsedComment?: string;
}

class RecentChangesService {
  private connection!: signalR.HubConnection;

  public async init() {
    const signalRUrl = process.env.NEXT_PUBLIC_SIGNALR_URL;
    console.log(signalRUrl);
    if (!signalRUrl) {
      throw new Error("SignalR URL is not defined in environment variables.");
    }

    this.connection = new signalR.HubConnectionBuilder().withUrl(signalRUrl).build();
  }

  public startConnection() {
    this.connection.start().catch((err) => console.error("Connection error: ", err));
  }

  public onReceiveMessage(callback: (user: string, message: RecentChangeObject) => void) {
    this.connection.on("statsMessage", callback);
  }

  public stopConnection() {
    this.connection.stop();
  }

  public isConnected(): boolean {
    return this.connection && this.connection.state === signalR.HubConnectionState.Connected;
  }
}

export default RecentChangesService;
