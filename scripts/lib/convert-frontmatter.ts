import { existsSync, readFileSync } from "fs";
import matter from "gray-matter";
import yaml from "js-yaml";

export function convertFrontmatter(outputPath?: string) {
  return function _convertFrontmatter(inputContent: string): string {
    let { data, content } = matter(inputContent);

    // Remove unnecessary fields
    delete data.emoji;
    delete data.type;

    // Convert published to private (reversed)
    data.private = !data.published;
    delete data.published;

    // Convert topics to tags
    data.tags = data.topics;
    delete data.topics;

    // Add new fields
    if (outputPath && existsSync(outputPath)) {
      let existingData = matter(readFileSync(outputPath, "utf8")).data;
      data.updated_at = existingData.updated_at || null;
      data.id = existingData.id || null;
      data.organization_url_name = existingData.organization_url_name || null;
    } else {
      data.updated_at = null;
      data.id = null;
      data.organization_url_name = null;
    }

    let frontmatter = yaml.dump(data);
    return `---\n${frontmatter}---\n${content}`;
  };
}
