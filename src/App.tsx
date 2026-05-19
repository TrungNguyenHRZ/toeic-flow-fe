import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Button onClick={() => toast.success("Exam created successfully")}>
        Start Exam
      </Button>
    </div>
  );
}
