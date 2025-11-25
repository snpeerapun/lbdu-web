import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService, ChatMessage } from 'src/app/shared/services/chat.service';
import { AppTranslateService } from 'src/app/shared/services/translate.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  messages: ChatMessage[] = [];
  messageInput = new FormControl('');
  isLoading = false;
  selectedImage: string | null = null;

  // Suggested questions
  private allSuggestedQuestionsEn: string[] = [
    'Can you explain about LH Fund?',
    'How to open a fund account?',
    'I need information about mutual fund investment',
    'Which funds are interesting right now?',
    'What are the risks in mutual fund investment?',
    'What are the fees for fund trading?',
    'Steps for buying and selling funds',
    'Documents required for account opening'
  ];

  private allSuggestedQuestionsTh: string[] = [
    'ช่วยอธิบายเกี่ยวกับกองทุน LH Fund',
    'วิธีการเปิดบัญชีกองทุน',
    'ต้องการทราบข้อมูลการลงทุนในกองทุนรวม',
    'กองทุนที่น่าสนใจในขณะนี้',
    'ความเสี่ยงในการลงทุนกองทุนรวม',
    'ค่าธรรมเนียมในการซื้อขายกองทุน',
    'ขั้นตอนการซื้อขายกองทุน',
    'เอกสารที่ต้องใช้ในการเปิดบัญชี'
  ];

  // Displayed suggested questions (random 5 items)
  suggestedQuestions: string[] = [];

  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  constructor(
    private chatService: ChatService,
    private translateService: AppTranslateService
  ) { }

  ngOnInit(): void {
    this.randomizeSuggestedQuestions();
    // Add welcome message
    this.messages.push({
      role: 'assistant',
      content: this.translateService.translateKey('chat.welcomeMessage'),
      timestamp: new Date()
    });
  }

  // Randomize 5 suggested questions
  private randomizeSuggestedQuestions() {
    const currentLang = this.translateService.getCurrentLanguage();
    const questions = currentLang === 'th' ? this.allSuggestedQuestionsTh : this.allSuggestedQuestionsEn;
    
    this.suggestedQuestions = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);
  }

  // Function for selecting a suggested question
  selectSuggestedQuestion(question: string): void {
    this.messageInput.setValue(question);
    this.sendMessage();
  }

  // Function to scroll to bottom
  private scrollToBottom(): void {
    requestAnimationFrame(() => {
      const element = this.messageContainer.nativeElement;
      element.scrollTo({
        top: element.scrollHeight,
        behavior: 'smooth'
      });
    });
  }

  // Function to open file input
  openFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  // Handle file selection
  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      alert(this.translateService.translateKey('chat.imageOnlyAlert'));
    }
    // Reset input to allow selecting the same file again
    event.target.value = '';
  }

  // Remove selected image
  removeSelectedImage(): void {
    this.selectedImage = null;
  }

  sendMessage(): void {
    const message = this.messageInput.value?.trim();
    
    // Check if there's at least a message or an image
    if ((!message && !this.selectedImage) || this.isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message || '',
      timestamp: new Date(),
      image: this.selectedImage || undefined
    };

    this.messages.push(userMessage);
    this.scrollToBottom();

    // Reset values
    this.messageInput.setValue('');
    this.selectedImage = null;
    this.isLoading = true;

    // Send message to OpenAI
    this.chatService.sendMessage(this.messages).subscribe({
      next: (response) => {
        const aiMessage = response.choices[0].message;
        this.messages.push({
          role: 'assistant',
          content: aiMessage.content,
          timestamp: new Date()
        });
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        this.messages.push({
          role: 'assistant',
          content: this.translateService.translateKey('chat.connectionError'),
          timestamp: new Date()
        });
        this.scrollToBottom();
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
