import * as React from "react";
import { Icon, Action, ActionPanel, Detail, List, useNavigation } from "@raycast/api";
import * as fs from "node:fs/promises";
import { promisify } from "node:util";
import { exec as _exec } from "node:child_process";
import { homedir } from "node:os";
import * as path from "node:path";
import { URL } from "node:url";

const exec = promisify(_exec);

type ProjectItem = {
  name: string;
  parentDir: string;
};

const dirsToWalk: string[] = [path.join(homedir(), "GitHub")];

const getProjects = async () => {
  const proms = dirsToWalk.map((dir) =>
    fs.readdir(dir, { withFileTypes: true }).then((els) =>
      els
        .filter((dirent) => dirent.isDirectory())
        .map<ProjectItem>((dirent) => ({
          name: dirent.name,
          parentDir: dir,
        }))
    )
  );

  return Promise.all(proms).then((res) => res.flat());
};

export default function ProjectLauncher() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [items, setItems] = React.useState<ProjectItem[]>([]);

  React.useEffect(() => {
    getProjects().then((r) => {
      setItems(r);
      setIsLoading(false);
    });
  }, []);

  const openInWebstorm = React.useCallback((item: ProjectItem) => {
    exec(`/Users/gksander/jetbrains/ws .`, { cwd: getProjectDir(item) });
  }, []);
  const openInGitHubDesktop = React.useCallback((item: ProjectItem) => {
    exec(`github .`, { cwd: getProjectDir(item) });
  }, []);
  const openInVSC = React.useCallback((item: ProjectItem) => {
    exec(`code .`, { cwd: getProjectDir(item) });
  }, []);
  const openInIterm = React.useCallback((item: ProjectItem) => {
    exec(`open -a iTerm .`, { cwd: getProjectDir(item) });
  }, []);
  const openInGitHubSite = React.useCallback(async (item: ProjectItem, action: string) => {
    const repoUrl = (await exec(`git config --get remote.origin.url`, { cwd: getProjectDir(item) })).stdout.replace(
      /\n/g,
      ""
    );

    let remoteHttpsUrl = "";
    if (repoUrl.startsWith("https")) {
      remoteHttpsUrl = repoUrl.replace(/\.git$/g, "");
    } else {
      const r = /^git@(.*):(.*)\/(.*)\.git$/;
      const match = repoUrl.match(r);
      if (match) {
        const [_, base, org, repo] = match;
        remoteHttpsUrl = `https://${base}/${org}/${repo}`;
      }
    }

    exec(`open ${remoteHttpsUrl}${action}`);
  }, []);

  return (
    <List isLoading={isLoading}>
      {items.map((item) => (
        <List.Item
          title={item.name}
          subtitle={item.parentDir}
          key={`${item.parentDir}/${item.name}`}
          actions={
            <ActionPanel title={item.name}>
              <Action
                title="Open in WebStorm"
                onAction={() => openInWebstorm(item)}
                icon={{ source: "webstorm.png" }}
              />
              <Action
                title="Open in GitHub"
                onAction={() => openInGitHubDesktop(item)}
                icon={{ source: "github.svg" }}
              />
              <Action title="Open in VSCode" onAction={() => openInVSC(item)} icon={{ source: "vscode.png" }} />
              <Action title="Open in iTerm" onAction={() => openInIterm(item)} icon={Icon.Terminal} />

              <Action title="Repo Site" onAction={() => openInGitHubSite(item, "/")} />
              <Action title="Issues" onAction={() => openInGitHubSite(item, "/issues")} />
              <Action title="Pull Requests" onAction={() => openInGitHubSite(item, "/pulls")} />
              <Action title="GH Actions" onAction={() => openInGitHubSite(item, "/actions")} />
              <Action title="Compare Branches" onAction={() => openInGitHubSite(item, "/compare")} />

              <Action.ShowInFinder title="Show in Finder" path={getProjectDir(item)} />
              <Action.CopyToClipboard title="Copy path to Clipboard" content={getProjectDir(item)} />
              <Action.OpenWith path={path.join(item.parentDir, item.name)} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

const getProjectDir = (item: ProjectItem) => path.join(item.parentDir, item.name);

function ActOnProject() {
  return <Detail markdown="**Hello** _World_!" />;
}
