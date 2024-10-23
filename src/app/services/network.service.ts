import { Injectable } from '@angular/core';
import { Network, NetworkStatus } from '@capacitor/network'; 

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  async isOnline(): Promise<boolean> {
    const status: NetworkStatus = await Network.getStatus();
    return status.connected;
  }

  onNetworkChange(callback: (isOnline: boolean) => void) {
    Network.addListener('networkStatusChange', (status: NetworkStatus) => {
      callback(status.connected);
    });
  }
}
