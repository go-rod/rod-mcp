package types

import (
	"fmt"
	"github.com/go-rod/rod"
	"github.com/go-rod/rod-mcp/types/js"
	"github.com/go-rod/rod-mcp/utils"
	"github.com/pkg/errors"
	"gopkg.in/yaml.v3"
	"regexp"
	"strconv"
	"strings"
)

const snapshotTpl = `
- Page URL: {{ .URL }}
- Page Title: {{ .Title }}
- Frame Count: {{ .Frames }}
- Page Snapshot
` + "```yaml\n" + "{{ .Snapshot }}" + "\n```\n"

type Snapshot struct {
	frames       []*rod.Page
	textSnapshot string
}

func BuildSnapshot(p *rod.Page) (*Snapshot, error) {
	snapshot := &Snapshot{
		frames: []*rod.Page{},
	}
	yamlDoc, err := snapshot.captureSnapshotWithFrames(p)
	if err != nil {
		return nil, err
	}

	yamlBytes, err := yaml.Marshal(yamlDoc)
	if err != nil {
		return nil, errors.Wrapf(err, "capture snapshot with frames failed,because of yaml marsha")
	}

	pageInfo, err := p.Info()
	if err != nil {
		return nil, errors.Wrapf(err, "capture snapshot with frames failed")
	}

	tplInfo := map[string]any{
		"URL":      pageInfo.URL,
		"Title":    pageInfo.Title,
		"Snapshot": strings.TrimSpace(string(yamlBytes)),
		"Frames":   len(snapshot.frames),
	}
	res, err := utils.ExecuteTemple(snapshotTpl, tplInfo)
	if err != nil {
		return nil, errors.Wrapf(err, "capture snapshot with frames failed, because of tple exec failed")
	}
	snapshot.textSnapshot = res
	return snapshot, nil
}

func (s *Snapshot) String() string {
	return s.textSnapshot
}

func (s *Snapshot) captureSnapshotWithFrames(p *rod.Page) (*yaml.Node, error) {
	s.frames = append(s.frames, p)
	frameIndex := len(s.frames) - 1

	rawSnapshot, err := p.Eval(js.AriaSnapshot, "document.body", "({ref: true})")
	if err != nil {
		return nil, errors.Wrapf(err, "capture snapshot with frames failed, frame index: %d", frameIndex)
	}

	var snapNode yaml.Node

	err = yaml.Unmarshal([]byte(rawSnapshot.Value.String()), &snapNode)
	if err != nil {
		return nil, errors.Wrapf(err, "capture snapshot with frames failed, frame index: %d", frameIndex)
	}
	return s.walk(&snapNode, frameIndex, p)

}

func (s *Snapshot) walk(node *yaml.Node, frameIndex int, frame *rod.Page) (*yaml.Node, error) {
	if node.Kind == yaml.DocumentNode && len(node.Content) > 0 {
		rootNode := node.Content[0]
		processedRoot, err := s.walk(rootNode, frameIndex, frame)
		if err != nil {
			return nil, err
		}
		node.Content[0] = processedRoot
		return node, nil
	}
	switch node.Kind {
	case yaml.MappingNode:
		// Process mapping nodes (key-value pairs)
		for i := 0; i < len(node.Content); i += 2 {
			keyNode := node.Content[i]
			valueNode := node.Content[i+1]

			// Process key
			newKey, err := s.walk(keyNode, frameIndex, frame)
			if err != nil {
				return nil, err
			}

			// Process value
			newValue, err := s.walk(valueNode, frameIndex, frame)
			if err != nil {
				return nil, err
			}

			node.Content[i] = newKey
			node.Content[i+1] = newValue
		}
	case yaml.SequenceNode:
		// Process sequence nodes
		for i, item := range node.Content {
			processedItem, err := s.walk(item, frameIndex, frame)
			if err != nil {
				return nil, err
			}
			node.Content[i] = processedItem
		}
	case yaml.ScalarNode:
		// Process scalar nodes
		if node.Tag == "!!str" {

			value := node.Value
			if frameIndex > 0 {
				node.Value = strings.Replace(value, "[ref=", fmt.Sprintf("[ref=f%d", frameIndex), 1)
			}

			if strings.HasPrefix(value, "iframe ") {
				re := regexp.MustCompile(`\[ref=(.*?)\]`)
				matches := re.FindStringSubmatch(value)
				if len(matches) > 1 {
					ref := matches[1]

					// Create a new mapping node to represent the pair
					// default for error
					pairNode := &yaml.Node{
						Kind: yaml.MappingNode,
						Content: []*yaml.Node{
							{Kind: yaml.ScalarNode, Value: node.Value},
							{Kind: yaml.ScalarNode, Value: "<could not capture iframe snapshot>"},
						},
					}

					childFrameEle, err := utils.QueryEleByAria(frame, ref)

					if err != nil {
						return pairNode, nil
					}
					childFrame, err := childFrameEle.Frame()
					if err != nil {
						return pairNode, nil
					}
					childSnapshot, err := s.captureSnapshotWithFrames(childFrame)

					if err != nil {
						return pairNode, nil
					}

					if len(childSnapshot.Content) == 0 {
						pairNode.Content = []*yaml.Node{
							{Kind: yaml.ScalarNode, Value: node.Value},
							nil,
						}
					} else {
						pairNode.Content = []*yaml.Node{
							{Kind: yaml.ScalarNode, Value: node.Value},
							childSnapshot.Content[0],
						}
					}

					return pairNode, nil
				}
			}
		}
	}
	return node, nil
}

func (s *Snapshot) LocatorInFrame(ref string) (*rod.Element, error) {
	frame := s.frames[0]
	matches := regexp.MustCompile(`^f(\d+)(.*)`).FindStringSubmatch(ref)
	if len(matches) > 0 {
		frameIndex, err := strconv.Atoi(matches[1])
		if err != nil {
			return nil, errors.Wrapf(err, "locator frame failed, because of frame index is not number")
		}

		if frameIndex < 0 || frameIndex > len(s.frames) {
			return nil, errors.Errorf("locator frame failed, because of frame index is out of range")
		}
		frame = s.frames[frameIndex]
		ref = matches[2]
	}
	ele, err := utils.QueryEleByAria(frame, ref)
	if err != nil {
		return nil, errors.Wrapf(err, "locator frame failed, because of query element by aria failed")
	}
	return ele, nil

}
