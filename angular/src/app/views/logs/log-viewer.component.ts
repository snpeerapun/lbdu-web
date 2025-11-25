import { Component, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';

// log-entry.model.ts
export interface LogEntry {
  id: number;           // Unique ID for each log line
  timestamp: string;    // Log timestamp
  level: string;        // Log level (INFO, ERROR, WARN, etc.)
  message: string;      // Log message content
  showFullMessage?: boolean; // Toggle for show more/less
}

@Component({
  selector: 'app-log-viewer',
  templateUrl: './log-viewer.component.html',
  styleUrls: ['./log-viewer.component.css']
})
export class LogViewerComponent implements OnInit {

  selectedDate: string = '';
  logs: LogEntry[] = [];

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // Load logs with optional date filtering
  loadLogs(): void {
    const url = this.selectedDate ? `/logs?date=${this.selectedDate}` : '/logs';
    this.http.get(url).subscribe({
      next: (response: any) => {
        this.logs = response.map((log: LogEntry) => ({
          ...log,
          showFullMessage: false  // Initialize collapsed state
        }));
      },
      error: (err) => console.error('Error fetching logs:', err)
    });
  }

  // Handle date change for filtering
  onDateChange(event: any): void {
    this.selectedDate = event.target.value.replace(/-/g, '');
    this.loadLogs();
  }

  // Toggle full/collapsed log message
  toggleMessage(log: LogEntry): void {
    log.showFullMessage = !log.showFullMessage;
  }
}
