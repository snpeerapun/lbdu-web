// ng-upload-file.component.ts
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpService } from 'src/app/shared/services/http.service';
import { AlertService } from 'src/app/shared/services/alert.service';

export interface UploadConfig {
  endpoint: string;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  allowMultiple?: boolean;
  showProgress?: boolean;
  autoUpload?: boolean;
}

export interface UploadedFile {
  file: File;
  id?: string;
  progress?: number;
  status?: 'pending' | 'uploading' | 'success' | 'error';
  response?: any;
  error?: string;
}

@Component({
  selector: 'ng-upload-file',
  template: `
    <style>
      .upload-container {
        width: 100%;
      }
      
      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 10px;
        padding: 40px 20px;
        text-align: center;
        background: #fafafa;
        transition: all 0.3s ease;
        cursor: pointer;
        margin-bottom: 20px;
        position: relative;
      }

      .drop-zone:hover {
        border-color: #007bff;
        background: #f0f8ff;
      }

      .drop-zone.drag-over {
        border-color: #007bff;
        background: #e3f2fd;
        transform: scale(1.02);
        box-shadow: 0 4px 12px rgba(0,123,255,0.2);
      }

      .drop-zone.disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }

      .drop-zone-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .drop-zone-icon {
        font-size: 48px;
        color: #007bff;
        margin-bottom: 10px;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      .drop-zone-text {
        font-size: 16px;
        color: #333;
        margin-bottom: 5px;
        font-weight: 500;
      }

      .drop-zone-subtext {
        font-size: 14px;
        color: #666;
        margin-bottom: 15px;
      }

      .drop-zone-info {
        font-size: 12px;
        color: #999;
        margin-top: 10px;
      }

      .file-input {
        display: none;
      }

      .browse-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 25px;
        border-radius: 5px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(0,123,255,0.2);
      }

      .browse-btn:hover {
        background: #0056b3;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,123,255,0.3);
      }

      .file-list {
        margin-top: 15px;
      }

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 8px;
        border-left: 4px solid #007bff;
        transition: all 0.2s ease;
        animation: slideIn 0.3s ease;
      }

      .file-item:hover {
        background: #e9ecef;
        transform: translateX(2px);
      }

      .file-item.uploading {
        border-left-color: #ffc107;
      }

      .file-item.success {
        border-left-color: #28a745;
        background: #f8fff9;
      }

      .file-item.error {
        border-left-color: #dc3545;
        background: #fff8f8;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .file-info {
        display: flex;
        align-items: center;
        flex: 1;
      }

      .file-icon {
        font-size: 24px;
        margin-right: 12px;
        color: #007bff;
      }

      .file-details {
        flex: 1;
        min-width: 0;
      }

      .file-name {
        font-weight: 500;
        color: #333;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .file-meta {
        display: flex;
        gap: 10px;
        font-size: 12px;
        color: #666;
      }

      .file-actions {
        display: flex;
        gap: 5px;
        align-items: center;
      }

      .status-icon {
        font-size: 16px;
        margin-right: 8px;
      }

      .status-uploading {
        color: #ffc107;
        animation: spin 1s linear infinite;
      }

      .status-success {
        color: #28a745;
      }

      .status-error {
        color: #dc3545;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .remove-btn {
        background: #dc3545;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .remove-btn:hover {
        background: #c82333;
        transform: scale(1.05);
      }

      .retry-btn {
        background: #ffc107;
        color: #212529;
        border: none;
        padding: 6px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin-right: 5px;
        transition: all 0.2s ease;
      }

      .retry-btn:hover {
        background: #e0a800;
      }

      .upload-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
      }

      .upload-btn {
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        flex: 1;
        transition: all 0.3s ease;
        box-shadow: 0 2px 4px rgba(40,167,69,0.2);
      }

      .upload-btn:hover {
        background: #218838;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(40,167,69,0.3);
      }

      .upload-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .clear-btn {
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .clear-btn:hover {
        background: #5a6268;
      }

      .progress-bar {
        width: 100%;
        height: 4px;
        background: #e9ecef;
        border-radius: 2px;
        overflow: hidden;
        margin: 5px 0;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #007bff, #0056b3);
        border-radius: 2px;
        transition: width 0.3s ease;
        position: relative;
      }

      .progress-fill::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-image: linear-gradient(
          -45deg,
          rgba(255, 255, 255, .2) 25%,
          transparent 25%,
          transparent 50%,
          rgba(255, 255, 255, .2) 50%,
          rgba(255, 255, 255, .2) 75%,
          transparent 75%,
          transparent
        );
        background-size: 20px 20px;
        animation: move 1s linear infinite;
      }

      @keyframes move {
        0% { background-position: 0 0; }
        100% { background-position: 20px 20px; }
      }

      .message {
        padding: 10px 15px;
        border-radius: 6px;
        margin-top: 10px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .error-message {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      }

      .success-message {
        background: #d1e7dd;
        border: 1px solid #badbcc;
        color: #0f5132;
      }

      .warning-message {
        background: #fff3cd;
        border: 1px solid #ffecb5;
        color: #664d03;
      }

      .upload-summary {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-top: 1px solid #dee2e6;
        margin-top: 15px;
        font-size: 14px;
        color: #666;
      }

      .compact .drop-zone {
        padding: 20px;
      }

      .compact .drop-zone-icon {
        font-size: 32px;
        margin-bottom: 5px;
      }

      .compact .drop-zone-text {
        font-size: 14px;
      }

      .compact .drop-zone-subtext {
        font-size: 12px;
        margin-bottom: 10px;
      }
    </style>

    <div class="upload-container" [class.compact]="compact">
      <!-- Drop Zone -->
      <div class="drop-zone" 
           [class.drag-over]="isDragOver"
           [class.disabled]="disabled || (config.maxFiles && files.length >= config.maxFiles)"
           (click)="triggerFileSelect()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <div class="drop-zone-content">
          <span class="drop-zone-icon">{{ getDropZoneIcon() }}</span>
          <div class="drop-zone-text">{{ dropZoneText || 'Drag and drop files here' }}</div>
          <div class="drop-zone-subtext">{{ dropZoneSubtext || 'or click to browse files' }}</div>
          
          <button type="button" 
                  class="browse-btn" 
                  [disabled]="disabled"
                  (click)="triggerFileSelect(); $event.stopPropagation()">
            {{ browseButtonText || 'Browse Files' }}
          </button>

            <div class="drop-zone-info" *ngIf="showFileInfo">
              <div *ngIf="config.acceptedFileTypes?.length">
                Accepted: {{ (config.acceptedFileTypes || []).join(', ') }}
              </div>
              <div *ngIf="config.maxFileSize">
                Max size: {{ formatFileSize(config.maxFileSize) }}
              </div>
              <div *ngIf="config.maxFiles">
                Max files: {{ config.maxFiles }}
              </div>
            </div>
        </div>

        <input type="file" 
               class="file-input" 
               #fileInput
               [multiple]="config.allowMultiple !== false" 
               [accept]="getAcceptAttribute()"
               [disabled]="disabled"
               (change)="onFileSelect($event)">
      </div>

      <!-- File List -->
      <div class="file-list" *ngIf="files.length > 0">
        <div class="file-item" 
             *ngFor="let fileItem of files; let i = index"
             [class.uploading]="fileItem.status === 'uploading'"
             [class.success]="fileItem.status === 'success'"
             [class.error]="fileItem.status === 'error'">
          
          <div class="file-info">
            <span class="file-icon">{{ getFileIcon(fileItem.file) }}</span>
            <div class="file-details">
              <div class="file-name" [title]="fileItem.file.name">
                {{ fileItem.file.name }}
              </div>
              <div class="file-meta">
                <span>{{ formatFileSize(fileItem.file.size) }}</span>
                <span *ngIf="fileItem.status === 'uploading' && fileItem.progress !== undefined">
                  {{ fileItem.progress }}%
                </span>
                <span *ngIf="fileItem.status === 'error' && fileItem.error" class="text-danger">
                  {{ fileItem.error }}
                </span>
              </div>
              
              <!-- Progress bar for individual file -->
              <div class="progress-bar" 
                   *ngIf="fileItem.status === 'uploading' && config.showProgress !== false">
                <div class="progress-fill" 
                     [style.width.%]="fileItem.progress || 0">
                </div>
              </div>
            </div>
          </div>

          <div class="file-actions">
            <!-- Status Icon -->
            <span class="status-icon status-uploading" *ngIf="fileItem.status === 'uploading'">⏳</span>
            <span class="status-icon status-success" *ngIf="fileItem.status === 'success'">✅</span>
            <span class="status-icon status-error" *ngIf="fileItem.status === 'error'">❌</span>

            <!-- Action Buttons -->
            <button class="retry-btn" 
                    *ngIf="fileItem.status === 'error'" 
                    (click)="retryUpload(i)"
                    [disabled]="disabled">
              Retry
            </button>
            <button class="remove-btn" 
                    (click)="removeFile(i)"
                    [disabled]="disabled || fileItem.status === 'uploading'">
              Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Upload Actions -->
      <div class="upload-actions" *ngIf="files.length > 0 && !config.autoUpload">
        <button class="upload-btn" 
                (click)="uploadAllFiles()" 
                [disabled]="disabled || isUploading || !hasPendingFiles()">
          <span *ngIf="!isUploading">🚀 {{ uploadButtonText || 'Upload Files' }}</span>
          <span *ngIf="isUploading">⏳ Uploading...</span>
        </button>
        <button class="clear-btn" 
                (click)="clearFiles()" 
                [disabled]="disabled || isUploading">
          {{ clearButtonText || 'Clear All' }}
        </button>
      </div>

      <!-- Overall Progress -->
      <div class="progress-bar" 
           *ngIf="isUploading && overallProgress > 0 && config.showProgress !== false">
        <div class="progress-fill" [style.width.%]="overallProgress"></div>
      </div>

      <!-- Messages -->
      <div class="error-message message" *ngIf="errorMessage">
        ⚠️ {{ errorMessage }}
      </div>

      <div class="success-message message" *ngIf="successMessage">
        ✅ {{ successMessage }}
      </div>

      <div class="warning-message message" *ngIf="warningMessage">
        ⚡ {{ warningMessage }}
      </div>

      <!-- Upload Summary -->
      <div class="upload-summary" *ngIf="showSummary && files.length > 0">
        <span>Total files: {{ files.length }}</span>
        <span>Uploaded: {{ getUploadedCount() }}</span>
        <span>Failed: {{ getFailedCount() }}</span>
      </div>
    </div>
  `
})
export class NgUploadFileComponent implements OnInit {
  @Input() config: UploadConfig = { endpoint: '' };
  @Input() disabled: boolean = false;
  @Input() compact: boolean = false;
  @Input() showFileInfo: boolean = true;
  @Input() showSummary: boolean = false;
  
  // Customizable text
  @Input() dropZoneText: string = '';
  @Input() dropZoneSubtext: string = '';
  @Input() browseButtonText: string = '';
  @Input() uploadButtonText: string = '';
  @Input() clearButtonText: string = '';

  // Events
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() fileUploaded = new EventEmitter<{file: File, response: any}>();
  @Output() uploadComplete = new EventEmitter<UploadedFile[]>();
  @Output() uploadError = new EventEmitter<{file: File, error: string}>();
  @Output() filesChanged = new EventEmitter<UploadedFile[]>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  files: UploadedFile[] = [];
  isDragOver: boolean = false;
  isUploading: boolean = false;
  overallProgress: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  warningMessage: string = '';

  constructor(
    private httpService: HttpService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    // Set default configuration with proper type safety
    const defaultConfig: UploadConfig = {
      endpoint: '',
      acceptedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
      allowMultiple: true,
      showProgress: true,
      autoUpload: false
    };
    
    // Merge with provided config
    this.config = { ...defaultConfig, ...this.config };
  }

  triggerFileSelect() {
    if (!this.disabled && (!this.config.maxFiles || this.files.length < this.config.maxFiles)) {
      this.fileInput.nativeElement.click();
    }
  }

  onFileSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.addFiles(Array.from(files));
    }
    // Reset input value to allow selecting the same file again
    event.target.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disabled) {
      this.isDragOver = true;
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (this.disabled) return;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.addFiles(Array.from(files));
    }
  }

  addFiles(newFiles: File[]) {
    this.clearMessages();
    
    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check max files limit
      if (this.config.maxFiles && this.files.length + validFiles.length >= this.config.maxFiles) {
        this.warningMessage = `Maximum ${this.config.maxFiles} files allowed`;
        break;
      }

      // Validate file size
      if (this.config.maxFileSize && file.size > this.config.maxFileSize) {
        this.errorMessage = `File "${file.name}" exceeds maximum size of ${this.formatFileSize(this.config.maxFileSize)}`;
        continue;
      }

      // Validate file type
      if (this.config.acceptedFileTypes && this.config.acceptedFileTypes.length > 0) {
        const fileExtension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
        if (!this.config.acceptedFileTypes.includes(fileExtension)) {
          this.errorMessage = `File "${file.name}" type not allowed. Accepted types: ${this.config.acceptedFileTypes.join(', ')}`;
          continue;
        }
      }

      // Check if file already exists
      const exists = this.files.some(existingFile => 
        existingFile.file.name === file.name && 
        existingFile.file.size === file.size &&
        existingFile.file.lastModified === file.lastModified
      );

      if (exists) {
        this.warningMessage = `File "${file.name}" already selected`;
        continue;
      }

      validFiles.push(file);
    }

    // Add valid files
    validFiles.forEach(file => {
      const uploadedFile: UploadedFile = {
        file,
        id: this.generateId(),
        progress: 0,
        status: 'pending'
      };
      this.files.push(uploadedFile);
    });

    if (validFiles.length > 0) {
      this.filesSelected.emit(validFiles);
      this.filesChanged.emit([...this.files]);

      // Auto upload if enabled
      if (this.config.autoUpload) {
        this.uploadFiles(this.files.filter(f => f.status === 'pending'));
      }
    }
  }

  removeFile(index: number) {
    const file = this.files[index];
    if (file.status !== 'uploading') {
      this.files.splice(index, 1);
      this.filesChanged.emit([...this.files]);
      this.clearMessages();
    }
  }

  clearFiles() {
    this.files = this.files.filter(f => f.status === 'uploading');
    this.filesChanged.emit([...this.files]);
    this.clearMessages();
    this.overallProgress = 0;
  }

  uploadAllFiles() {
    const pendingFiles = this.files.filter(f => f.status === 'pending' || f.status === 'error');
    if (pendingFiles.length > 0) {
      this.uploadFiles(pendingFiles);
    }
  }

  retryUpload(index: number) {
    const file = this.files[index];
    if (file.status === 'error') {
      file.status = 'pending';
      file.error = undefined;
      this.uploadFiles([file]);
    }
  }

  private uploadFiles(filesToUpload: UploadedFile[]) {
    if (!this.config.endpoint) {
      this.errorMessage = 'Upload endpoint not configured';
      return;
    }

    this.isUploading = true;
    this.clearMessages();

    let completedUploads = 0;
    const totalUploads = filesToUpload.length;

    filesToUpload.forEach((fileItem, index) => {
      this.uploadSingleFile(fileItem).subscribe({
        next: (response: any) => {
          fileItem.status = 'success';
          fileItem.response = response;
          fileItem.progress = 100;
          completedUploads++;

          this.fileUploaded.emit({ file: fileItem.file, response });
          this.updateOverallProgress(completedUploads, totalUploads);

          if (completedUploads === totalUploads) {
            this.onAllUploadsComplete();
          }
        },
        error: (error: any) => {
          fileItem.status = 'error';
          fileItem.error = error.error?.message || 'Upload failed';
          completedUploads++;

          this.uploadError.emit({ file: fileItem.file,error: fileItem.error || 'Upload failed'  });
          this.updateOverallProgress(completedUploads, totalUploads);

          if (completedUploads === totalUploads) {
            this.onAllUploadsComplete();
          }
        }
      });
    });
  }

  private uploadSingleFile(fileItem: UploadedFile) {
    const formData = new FormData();
    formData.append('file', fileItem.file);
    formData.append('fileName', fileItem.file.name);
    formData.append('fileSize', fileItem.file.size.toString());

    fileItem.status = 'uploading';
    fileItem.progress = 0;

    return this.httpService.post(this.config.endpoint, formData);
  }

  private updateOverallProgress(completed: number, total: number) {
    this.overallProgress = Math.round((completed / total) * 100);
  }

  private onAllUploadsComplete() {
    this.isUploading = false;
    this.overallProgress = 0;

    const successCount = this.getUploadedCount();
    const failedCount = this.getFailedCount();

    if (failedCount === 0) {
      this.successMessage = `Successfully uploaded ${successCount} file(s)`;
    } else if (successCount === 0) {
      this.errorMessage = `Failed to upload ${failedCount} file(s)`;
    } else {
      this.warningMessage = `Uploaded ${successCount} file(s), failed ${failedCount} file(s)`;
    }

    this.uploadComplete.emit([...this.files]);
  }

  // Utility methods
  formatFileSize(bytes: number | undefined): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const iconMap: { [key: string]: string } = {
      'pdf': '📄',
      'doc': '📝', 'docx': '📝',
      'xls': '📊', 'xlsx': '📊', 'csv': '📊',
      'txt': '📄',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
      'zip': '📦', 'rar': '📦'
    };
    return iconMap[extension] || '📄';
  }

  getDropZoneIcon(): string {
    if (this.isDragOver) return '📥';
    if (this.files.length > 0) return '📁';
    return '☁️';
  }

  getAcceptAttribute(): string {
    return this.config.acceptedFileTypes?.join(',') || '';
  }

  hasPendingFiles(): boolean {
    return this.files.some(f => f.status === 'pending' || f.status === 'error');
  }

  getUploadedCount(): number {
    return this.files.filter(f => f.status === 'success').length;
  }

  getFailedCount(): number {
    return this.files.filter(f => f.status === 'error').length;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
    this.warningMessage = '';
  }

  // Public API methods
  public getFiles(): UploadedFile[] {
    return [...this.files];
  }

  public getSuccessfulFiles(): UploadedFile[] {
    return this.files.filter(f => f.status === 'success');
  }

  public getFailedFiles(): UploadedFile[] {
    return this.files.filter(f => f.status === 'error');
  }

  public reset() {
    this.files = [];
    this.isUploading = false;
    this.overallProgress = 0;
    this.clearMessages();
    this.filesChanged.emit([]);
  }
}