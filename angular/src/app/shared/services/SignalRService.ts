import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root'
})
export class SignalRService {
    private hubConnection: signalR.HubConnection;
    private messageSource = new BehaviorSubject<string>(null);
    currentMessage = this.messageSource.asObservable();

    public startConnection(): void {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/chathub', {
                withCredentials: false
            })
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('Connection started'))
            .catch(err => console.log('Error while starting connection: ' + err));

        this.hubConnection.on('ReceiveMessage', (user, message) => {
            this.messageSource.next(`${user}: ${message}`);
        });
    }

    public sendMessage(user: string, message: string): void {
        this.hubConnection.send('SendMessage', user, message)
            .catch(err => console.error(err));
    }
}
