import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import * as pdfjsLib from 'pdfjs-dist';
import { HttpService } from 'src/app/shared/services/http.service';
import { ToastService } from 'src/app/shared/services/toast.service';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

@Component({
  selector: 'app-doc-preview-modal',
  template:  `
  <div class="document-preview-modal" [class.fullscreen]="isFullscreen">
  <!-- Toolbar -->
  <div class="preview-toolbar">
    <!-- Left: Document Info -->
    <div class="toolbar-left">
      <i class="fas" [ngClass]="getFileIcon(document?.contentType)"></i>
      <div class="doc-info" *ngIf="document">
        <div class="doc-name">{{ document?.title || document?.fileName || 'Document Preview' }}</div>
        <div class="doc-meta">
          <span class="file-size">{{ formatFileSize(document.fileSize) }}</span>
          <span *ngIf="totalPages > 0"> • {{ totalPages }} pages</span>
        </div>
      </div>
    </div>

    <!-- Center: Zoom Controls -->
    <div class="toolbar-center">
      <!-- PDF Zoom Controls -->
      <div class="zoom-controls" *ngIf="document && isPDF(document.contentType) && !isLoading">
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="zoomOut()" 
                [disabled]="!canZoomOut"
                title="Zoom out"
                type="button">
          <i class="fas fa-search-minus"></i>
        </button>
        
        <span class="zoom-text">{{ pdfZoomPercent }}%</span>
        
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="zoomIn()" 
                [disabled]="!canZoomIn"
                title="Zoom in"
                type="button">
          <i class="fas fa-search-plus"></i>
        </button>
        
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="resetZoom()"
                title="Reset zoom"
                type="button">
          <i class="fas fa-undo"></i>
        </button>
      </div>

      <!-- Image Zoom Controls -->
      <div class="zoom-controls" *ngIf="document && isImage(document.contentType) && !isLoading">
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="imageZoomOut()" 
                [disabled]="!canZoomOut"
                title="Zoom out"
                type="button">
          <i class="fas fa-search-minus"></i>
        </button>
        
        <span class="zoom-text">{{ imageZoomPercent }}%</span>
        
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="imageZoomIn()" 
                [disabled]="!canZoomIn"
                title="Zoom in"
                type="button">
          <i class="fas fa-search-plus"></i>
        </button>
        
        <button class="btn btn-sm btn-outline-secondary" 
                (click)="imageZoomReset()"
                title="Reset zoom"
                type="button">
          <i class="fas fa-undo"></i>
        </button>
      </div>
    </div>

    <!-- Right: Action Buttons -->
    <div class="toolbar-right">
      <button class="btn btn-sm btn-outline-secondary" 
              (click)="printDocument()"
              [disabled]="!fileBlobUrl || isLoading"
              title="Print"
              type="button">
        <i class="fas fa-print"></i>
      </button>

      <button class="btn btn-sm btn-outline-secondary" 
              (click)="downloadDocument()"
              [disabled]="!document || isLoading"
              title="Download"
              type="button">
        <i class="fas fa-download"></i>
      </button>

      <button class="btn btn-sm btn-outline-secondary" 
              (click)="toggleFullscreen()"
              [title]="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
              type="button">
        <i class="fas" [ngClass]="isFullscreen ? 'fa-compress' : 'fa-expand'"></i>
      </button>

      <!--<button class="btn btn-sm btn-outline-secondary" 
              (click)="closeModal()"
              title="Close"
              type="button">
        <i class="fas fa-times"></i>
      </button>-->
    </div>
  </div>

  <!-- Preview Container -->
  <div class="preview-container">
    <!-- Loading State -->
    <div class="preview-state" *ngIf="isLoading || isLoadingFile">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Loading document...</p>
    </div>

    <!-- Error State -->
    <div class="preview-state" *ngIf="!isLoading && loadError">
      <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
      <p>{{ loadError }}</p>
      <button class="btn btn-primary mt-3" (click)="closeModal()" type="button">
        <i class="fas fa-times me-2"></i>
        Close
      </button>
    </div>

    <!-- PDF Viewer -->
    <div *ngIf="!isLoading && !loadError && document && isPDF(document.contentType)" 
         class="pdf-viewer">
      <div class="pdf-scroll-container" #pdfContainer>
        <!-- PDF pages rendered here -->
      </div>
    </div>

    <!-- Image Viewer -->
    <div *ngIf="!isLoading && !loadError && document && isImage(document.contentType)" 
         class="image-viewer">
      <img [src]="previewImageUrl" 
           [alt]="document.fileName"
           [style.transform]="'scale(' + imageZoom + ')'"
           class="preview-image">
    </div>

    <!-- Unsupported Format -->
    <div *ngIf="!isLoading && !loadError && document && !canPreview()" 
         class="preview-state">
      <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
      <p>Cannot preview this file type</p>
      <p class="text-muted small mb-3">Download to view the file</p>
      <button class="btn btn-primary" (click)="downloadDocument()" type="button">
        <i class="fas fa-download me-2"></i>
        Download File
      </button>
    </div>
  </div>
</div>
    `,
  styles: [`
.document-preview-modal {
  display: flex;
  flex-direction: column;
  height: 80vh;
  background: #1a1a1a;
  border-radius: 8px;
  overflow: hidden;
}

.document-preview-modal.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
}

/* Toolbar */
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  flex-shrink: 0;
  gap: 1rem;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.toolbar-left > .fas {
  font-size: 1.5rem;
  color: #64b5f6;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-meta {
  font-size: 0.8125rem;
  color: #999;
  margin-top: 0.25rem;
}

.file-size {
  font-weight: 500;
}

.toolbar-center {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #1a1a1a;
  border-radius: 6px;
}

.zoom-text {
  min-width: 50px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* Buttons */
.btn-outline-secondary {
  background: transparent;
  border: 1px solid #404040;
  color: #ccc;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-outline-secondary:hover:not(:disabled) {
  background: #404040;
  border-color: #64b5f6;
  color: #fff;
}

.btn-outline-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-outline-secondary i {
  font-size: 0.875rem;
}

/* Preview Container */
.preview-container {
  flex: 1;
  background: #1a1a1a;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Custom Scrollbar */
.preview-container::-webkit-scrollbar {
  width: 12px;
  height: 12px;
}

.preview-container::-webkit-scrollbar-track {
  background: #1a1a1a;
}

.preview-container::-webkit-scrollbar-thumb {
  background: #404040;
  border-radius: 6px;
}

.preview-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* States */
.preview-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #fff;
}

.preview-state p {
  margin: 0;
  color: #ccc;
  font-size: 1rem;
}

.preview-state .text-muted {
  color: #999 !important;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

/* PDF Viewer */
.pdf-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 1.5rem;
}

.pdf-scroll-container {
  max-width: 900px;
  margin: 0 auto;
}

.pdf-page-wrapper {
  margin-bottom: 20px;
}

.pdf-page-wrapper:last-child {
  margin-bottom: 0;
}

.pdf-page-label {
  text-align: center;
  margin-bottom: 8px;
  color: #ccc;
  font-size: 0.875rem;
  font-weight: 500;
}

.pdf-page-wrapper canvas {
  display: block;
  width: 100%;
  height: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  background: white;
  border-radius: 4px;
}

/* Image Viewer */
.image-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 2rem;
}

.preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease;
  transform-origin: center center;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 992px) {
  .toolbar-center {
    display: none;
  }
}

@media (max-width: 768px) {
  .document-preview-modal {
    height: 100vh;
    border-radius: 0;
  }

  .preview-toolbar {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
  }

  .toolbar-left {
    width: 100%;
    margin-bottom: 0.5rem;
  }

  .toolbar-left > .fas {
    font-size: 1.25rem;
  }

  .doc-name {
    font-size: 0.9375rem;
  }

  .doc-meta {
    font-size: 0.75rem;
  }

  .toolbar-right {
    width: 100%;
    justify-content: flex-end;
  }

  .toolbar-right .btn-outline-secondary {
    padding: 0.375rem 0.625rem;
  }

  .toolbar-right .btn-outline-secondary i {
    font-size: 0.8125rem;
  }

  .preview-container {
    padding: 1rem;
  }

  .pdf-viewer {
    padding: 1rem;
  }

  .image-viewer {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .preview-toolbar {
    padding: 0.5rem 0.75rem;
  }

  .toolbar-left {
    gap: 0.75rem;
  }

  .doc-name {
    font-size: 0.875rem;
  }

  .toolbar-right {
    gap: 0.375rem;
  }

  .toolbar-right .btn-outline-secondary {
    padding: 0.25rem 0.5rem;
  }
}

/* Fullscreen specific styles */
.document-preview-modal.fullscreen .preview-toolbar {
  background: rgba(45, 45, 45, 0.95);
  backdrop-filter: blur(10px);
}

.document-preview-modal.fullscreen .preview-container {
  background: #000;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.document-preview-modal {
  animation: fadeIn 0.2s ease-in-out;
}
  `]
})
export class DocPreviewModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pdfContainer', { static: false }) pdfContainer!: ElementRef<HTMLDivElement>;

  // Data passed from parent
  data: any;

  // Document data
  document: any = null;
  documentId: string = '';

  // File data
  fileBlob: Blob | null = null;
  fileBlobUrl: string | null = null;

  // Loading state
  isLoading = true;
  isLoadingFile = false;
  loadError: string = '';
  isFullscreen = false;
  // PDF state
  pdfZoom = 1.0;
  pdfDoc: any = null;
  totalPages = 0;

  // Image state
  imageZoom = 1.0;
  previewImageUrl = '';

    private readonly MIN_ZOOM = 0.5;
  private readonly MAX_ZOOM = 3.0;
  private readonly ZOOM_STEP = 0.25;
  private readonly BASE_SCALE = 2.0;
  // Cleanup
  private destroy$ = new Subject<void>();

  // File type configurations
  private readonly IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  private readonly PDF_TYPES = ['application/pdf', '.pdf'];

  constructor(
    private httpService: HttpService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Get document from parent data
    if (this.data?.documentId) {
      this.documentId = this.data.documentId;
      this.loadDocument(this.documentId);
    } else if (this.data?.document) {
      // Direct document object
      this.document = this.data.document;
      this.isLoading = false;
      this.loadFileFromServer();
    } else {
      this.loadError = 'No document provided';
      this.isLoading = false;
    }

    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('msfullscreenchange', this.onFullscreenChange.bind(this));
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
   document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('msfullscreenchange', this.onFullscreenChange.bind(this));
    this.cleanupResources();
  }
  private onFullscreenChange(): void {
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    );
    
    this.isFullscreen = isFullscreen;
  }
  // ========================================
  // Document Loading
  // ========================================
toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    
    if (this.isFullscreen) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  private enterFullscreen(): void {
    const element = document.documentElement;
    
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }
  loadDocument(id: string): void {
    this.isLoading = true;
 
    this.httpService.get(`/document/view/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response: any) => {
          this.document = response;
          this.loadFileFromServer();
        },
        error: (error) => {
          this.loadError = error?.error?.message || 'Failed to load document';
          this.toast.error(this.loadError, 'Error');
        }
      });
  }
 
  loadFileFromServer(): void {
    if (!this.document?.id) return;

    this.isLoadingFile = true;
 
    this.httpService.download(`/document/download/${this.document.id} `)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingFile = false)
      )
      .subscribe({
        next: (blob: Blob) => {
          this.fileBlob = blob;
          this.fileBlobUrl = URL.createObjectURL(blob);

          const mimeType = blob.type || this.document?.contentType || '';

          if (this.isPDF(mimeType)) {
            this.loadPdfFromBlob(blob);
          } else if (this.isImage(mimeType)) {
            this.loadImageFromBlob();
          }
        },
        error: (error: any) => {
          this.loadError = 'Failed to load file';
          this.toast.error(this.loadError, 'Error');
        }
      });
  }
 
  // ========================================
  // PDF Handling
  // ========================================

  async loadPdfFromBlob(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
      this.pdfDoc = await loadingTask.promise;
      this.totalPages = this.pdfDoc.numPages;

      setTimeout(() => {
        this.renderAllPages();
      }, 100);
    } catch (error) {
      console.error('Error loading PDF:', error);
      this.loadError = 'Failed to load PDF';
      this.toast.error(this.loadError, 'Error');
    }
  }

  async renderAllPages(): Promise<void> {
    if (!this.pdfDoc || !this.pdfContainer) return;

    const container = this.pdfContainer.nativeElement;
    container.innerHTML = '';

    for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
      await this.renderPage(pageNum, container);
    }
  }

  async renderPage(pageNum: number, container: HTMLElement): Promise<void> {
    try {
      const page = await this.pdfDoc.getPage(pageNum);
      
      const baseScale = 2.0;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scale = this.pdfZoom * baseScale * devicePixelRatio;
      const viewport = page.getViewport({ scale: scale });

      // Create wrapper
      const pageWrapper = document.createElement('div');
      pageWrapper.className = 'pdf-page-wrapper';

      // Page label
      const pageLabel = document.createElement('div');
      pageLabel.className = 'pdf-page-label';
      pageLabel.textContent = `Page ${pageNum} of ${this.totalPages}`;
      pageWrapper.appendChild(pageLabel);

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', {
        alpha: false,
        willReadFrequently: false
      });

      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const displayWidth = Math.floor(viewport.width / devicePixelRatio);
      const displayHeight = Math.floor(viewport.height / devicePixelRatio);
      
      canvas.style.cssText = `
        width: ${displayWidth}px;
        height: ${displayHeight}px;
        max-width: 100%;
        height: auto;
        display: block;
        margin: 0 auto;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
      `;

      pageWrapper.appendChild(canvas);
      container.appendChild(pageWrapper);

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        intent: 'display',
        background: '#ffffff'
      };

      await page.render(renderContext).promise;
      
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  }

  zoomIn(): void {
    if (this.pdfZoom < 3) {
      this.pdfZoom += 0.25;
      this.rerenderPdf();
    }
  }

  zoomOut(): void {
    if (this.pdfZoom > 0.5) {
      this.pdfZoom -= 0.25;
      this.rerenderPdf();
    }
  }

  resetZoom(): void {
    this.pdfZoom = 1.0;
    this.rerenderPdf();
  }

  private rerenderPdf(): void {
    if (this.pdfDoc && this.pdfContainer) {
      this.renderAllPages();
    }
  }

  // ========================================
  // Image Handling
  // ========================================

  loadImageFromBlob(): void {
    if (this.fileBlobUrl) {
      this.previewImageUrl = this.fileBlobUrl;
    }
  }

  imageZoomIn(): void {
    if (this.imageZoom < 3) {
      this.imageZoom += 0.25;
    }
  }

  imageZoomOut(): void {
    if (this.imageZoom > 0.5) {
      this.imageZoom -= 0.25;
    }
  }

  imageZoomReset(): void {
    this.imageZoom = 1.0;
  }

  // ========================================
  // File Type Detection
  // ========================================

  isPDF(mimeType: string): boolean {
    if (!mimeType) return false;
    return this.PDF_TYPES.some(type => 
      mimeType.toLowerCase().includes(type.toLowerCase())
    );
  }

  isImage(mimeType: string): boolean {
    if (!mimeType) return false;
    return this.IMAGE_TYPES.includes(mimeType.toLowerCase());
  }

  canPreview(): boolean {
    if (!this.document) return false;
    const mimeType = this.document.contentType || '';
    return this.isPDF(mimeType) || this.isImage(mimeType);
  }

  // ========================================
  // Actions
  // ========================================

  downloadDocument(): void {
    if (!this.fileBlob || !this.document) return;

    const link = document.createElement('a');
    link.href = this.fileBlobUrl!;
    link.download = this.document.fileName || this.document.title || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printDocument(): void {
    if (!this.fileBlobUrl) return;

    const mimeType = this.document?.contentType || '';

    if (this.isPDF(mimeType)) {
      const printWindow = window.open(this.fileBlobUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        });
      }
    } else if (this.isImage(mimeType)) {
      const printWindow = window.open('', '_blank');
      if (printWindow && this.fileBlobUrl) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print - ${this.document?.fileName || 'Document'}</title>
              <style>
                body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                img { max-width: 100%; height: auto; }
                @media print {
                  body { margin: 0; }
                  img { max-width: 100%; page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <img src="${this.fileBlobUrl}" onload="window.print();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  }

  closeModal(): void {
    // Modal will handle closing
  }

  // ========================================
  // Cleanup
  // ========================================

  private cleanupResources(): void {
    if (this.pdfDoc) {
      this.pdfDoc.destroy();
      this.pdfDoc = null;
    }

    if (this.fileBlobUrl) {
      URL.revokeObjectURL(this.fileBlobUrl);
      this.fileBlobUrl = null;
    }

    this.fileBlob = null;
  }

  // ========================================
  // UI Helpers
  // ========================================

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileIcon(mimeType: string): string {
    if (!mimeType) return 'fa-file';
    if (this.isPDF(mimeType)) return 'fa-file-pdf';
    if (this.isImage(mimeType)) return 'fa-file-image';
    return 'fa-file';
  }

  get canZoomIn(): boolean {
    return this.isPDF(this.document?.contentType || '') 
      ? this.pdfZoom < this.MAX_ZOOM 
      : this.imageZoom < this.MAX_ZOOM;
  }

  get canZoomOut(): boolean {
    return this.isPDF(this.document?.contentType || '') 
      ? this.pdfZoom > this.MIN_ZOOM 
      : this.imageZoom > this.MIN_ZOOM;
  }

  get pdfZoomPercent(): string {
    return (this.pdfZoom * 100).toFixed(0);
  }

  get imageZoomPercent(): string {
    return (this.imageZoom * 100).toFixed(0);
  }
}