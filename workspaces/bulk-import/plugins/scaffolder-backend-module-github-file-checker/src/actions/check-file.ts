/*
 * Copyright Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ScmIntegrations } from '@backstage/integration';
import { Octokit } from '@octokit/rest';
import { InputError } from '@backstage/errors';

export const createGithubFileExistsAction = (options: {
  integrations: ScmIntegrations;
}) => {
  const { integrations } = options;

  return createTemplateAction<{
    repoUrl: string;
    filePath: string;
  }>({
    id: 'github:file:exists',
    description: 'Checks if a file exists in a GitHub repository.',
    schema: {
      input: {
        type: 'object',
        required: ['repoUrl', 'filePath'],
        properties: {
          repoUrl: {
            title: 'Repository URL',
            description: 'The URL to the repository',
            type: 'string',
          },
          filePath: {
            title: 'File Path',
            description: 'The path to the file in the repository',
            type: 'string',
          },
        },
      },
      output: {
        type: 'object',
        properties: {
          isFileExists: {
            title: 'File Exists',
            type: 'boolean',
          },
        },
      },
    },
    async handler(ctx) {
      const { repoUrl, filePath } = ctx.input;

      const integration = integrations.github.byUrl(repoUrl);
      if (!integration) {
        throw new InputError(`No GitHub integration found for URL: ${repoUrl}`);
      }

      const match = repoUrl.match(/github\.com\/(.*)\/(.*)/);
      if (!match) {
        throw new InputError(`Invalid repository URL: ${repoUrl}`);
      }
      const owner = match[1];
      const repo = match[2];

      const octokit = new Octokit({
        auth: integration.config.token,
      });

      try {
        await octokit.rest.repos.getContent({
          owner,
          repo,
          path: filePath,
        });
        ctx.output('isFileExists', true);
      } catch (error: any) {
        if (error.status === 404) {
          ctx.output('isFileExists', false);
        } else {
          throw new Error(`Failed to check file existence: ${error.message}`);
        }
      }
    },
  });
};
