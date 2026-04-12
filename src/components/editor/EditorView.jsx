import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code, Image, Video, Globe } from "lucide-react";
import UIBuilder from "./UIBuilder";
import ImageGenerator from "./ImageGenerator";
import VideoCreator from "./VideoCreator";
import WebBrowser from "./WebBrowser";

export default function EditorView({ onCommand }) {
  return (
    <div className="p-3 md:p-6 h-full overflow-y-auto">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground">Editor Studio</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Create and edit UI, images, video, and browse the web — all connected to the AI agent</p>
      </div>

      <Tabs defaultValue="ui" className="w-full h-[calc(100%-60px)]">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="ui" className="text-xs gap-1.5">
            <Code className="w-3 h-3" /> UI Builder
          </TabsTrigger>
          <TabsTrigger value="image" className="text-xs gap-1.5">
            <Image className="w-3 h-3" /> Image Gen
          </TabsTrigger>
          <TabsTrigger value="video" className="text-xs gap-1.5">
            <Video className="w-3 h-3" /> Video
          </TabsTrigger>
          <TabsTrigger value="browser" className="text-xs gap-1.5">
            <Globe className="w-3 h-3" /> Web Browser
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ui" className="mt-4 h-[calc(100%-50px)]">
          <UIBuilder onCommand={onCommand} />
        </TabsContent>
        <TabsContent value="image" className="mt-4 h-[calc(100%-50px)]">
          <ImageGenerator />
        </TabsContent>
        <TabsContent value="video" className="mt-4 h-[calc(100%-50px)]">
          <VideoCreator />
        </TabsContent>
        <TabsContent value="browser" className="mt-4 h-[calc(100%-50px)]">
          <WebBrowser />
        </TabsContent>
      </Tabs>
    </div>
  );
}