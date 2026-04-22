import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, file_path, content, command } = body;

    // FULL FILE EDITOR — Agent can read/write ANY file in the codebase
    if (action === 'read_file') {
      try {
        const fileContent = await Deno.readTextFile(`./src/${file_path}`);
        return Response.json({
          file_path,
          content: fileContent,
          size_bytes: fileContent.length,
          readable: true,
        });
      } catch (e) {
        return Response.json({ error: `File not found: ${file_path}`, status: 404 });
      }
    }

    if (action === 'write_file') {
      try {
        await Deno.writeTextFile(`./src/${file_path}`, content);
        return Response.json({
          file_path,
          status: 'WRITTEN',
          bytes_written: content.length,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return Response.json({ error: `Write failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'create_file') {
      try {
        const dir = `./src/${file_path.split('/').slice(0, -1).join('/')}`;
        await Deno.mkdir(dir, { recursive: true });
        await Deno.writeTextFile(`./src/${file_path}`, content);
        return Response.json({
          file_path,
          status: 'CREATED',
          bytes: content.length,
        });
      } catch (e) {
        return Response.json({ error: `Create failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'delete_file') {
      try {
        await Deno.remove(`./src/${file_path}`);
        return Response.json({
          file_path,
          status: 'DELETED',
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return Response.json({ error: `Delete failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'list_directory') {
      try {
        const files = [];
        for await (const entry of Deno.readDir(`./src/${file_path}`)) {
          files.push({
            name: entry.name,
            is_dir: entry.isDirectory,
            is_file: entry.isFile,
          });
        }
        return Response.json({ directory: file_path, files, count: files.length });
      } catch (e) {
        return Response.json({ error: `Directory read failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'find_and_replace') {
      try {
        const fileContent = await Deno.readTextFile(`./src/${file_path}`);
        const { find, replace } = body;
        const updated = fileContent.replace(new RegExp(find, 'g'), replace);
        await Deno.writeTextFile(`./src/${file_path}`, updated);
        return Response.json({
          file_path,
          replacements_made: (fileContent.match(new RegExp(find, 'g')) || []).length,
          status: 'UPDATED',
        });
      } catch (e) {
        return Response.json({ error: `Replace failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'execute_command') {
      // Agent can run ANY terminal command
      try {
        const proc = Deno.run({
          cmd: command.split(' '),
          stdout: 'piped',
          stderr: 'piped',
        });
        const { success } = await proc.status();
        const output = await new TextDecoder().decode(await proc.output());
        
        return Response.json({
          command,
          exit_code: success ? 0 : 1,
          output,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return Response.json({ error: `Command failed: ${e.message}`, status: 500 });
      }
    }

    if (action === 'git_push') {
      try {
        const proc1 = Deno.run({
          cmd: ['git', 'add', '.'],
          stdout: 'piped',
        });
        await proc1.status();

        const proc2 = Deno.run({
          cmd: ['git', 'commit', '-m', body.message || 'Auto-commit from agent'],
          stdout: 'piped',
        });
        await proc2.status();

        const proc3 = Deno.run({
          cmd: ['git', 'push'],
          stdout: 'piped',
        });
        await proc3.status();

        return Response.json({
          status: 'PUSHED',
          message: body.message,
          timestamp: new Date().toISOString(),
        });
      } catch (e) {
        return Response.json({ error: `Git push failed: ${e.message}`, status: 500 });
      }
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});