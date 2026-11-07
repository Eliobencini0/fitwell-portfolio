import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-3xl">
            💪
          </div>
          <h1 className="text-2xl font-bold text-foreground">Fitness Tracker</h1>
          <p className="text-muted-foreground">Crea il tuo account</p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
