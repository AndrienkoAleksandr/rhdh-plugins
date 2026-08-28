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

import { configApiRef } from '@backstage/core-plugin-api';
import { MockConfigApi, TestApiProvider } from '@backstage/test-utils';

import { render, screen } from '@testing-library/react';
import { useFormikContext } from 'formik';

import { mockGetRepositories } from '../../mocks/mockData';
import { ImportFlow, RepositorySelection } from '../../types';
import { CatalogInfoStatus } from './CatalogInfoStatus';

jest.mock('formik', () => ({
  ...jest.requireActual('formik'),
  useFormikContext: jest.fn(),
}));

describe('CatalogInfoStatus', () => {
  const repo = mockGetRepositories.repositories[0];
  const githubAppError =
    "Orchestrator import requires a GitHub App installation token for 'https://github.com/org/dessert/cupcake'.";

  beforeEach(() => {
    (useFormikContext as jest.Mock).mockReturnValue({
      values: {
        repositoryType: RepositorySelection.Repository,
      },
      setFieldValue: jest.fn(),
      status: {
        errors: {
          'org/dessert/cupcake': {
            repository: {
              name: repo.repoName,
              organization: repo.orgName,
            },
            catalogEntityName: '',
            error: {
              message: [githubAppError],
            },
          },
        },
      },
    });
  });

  it('shows the submit error instead of Ready to import when orchestrator create failed', () => {
    render(
      <TestApiProvider
        apis={[
          [
            configApiRef,
            new MockConfigApi({
              bulkImport: { importAPI: ImportFlow.Orchestrator },
            }),
          ],
        ]}
      >
        <CatalogInfoStatus data={repo} />
      </TestApiProvider>,
    );

    expect(screen.queryByText('Ready to import')).not.toBeInTheDocument();
    expect(screen.getByText('Aborted')).toBeInTheDocument();
    expect(screen.getByTitle(githubAppError)).toBeInTheDocument();
  });
});
